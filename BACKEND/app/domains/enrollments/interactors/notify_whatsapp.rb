module Enrollments
  module Interactors
    class NotifyWhatsapp
      def call(enrollment_id:)
        enrollment = ::Enrollment.includes(:event, :user).find(enrollment_id)
        event = enrollment.event
        user = enrollment.user
        phone = user.user_profile&.phone

        return unless event.whatsapp_invite_link.present?
        return unless phone.present?
        return unless ENV['WHATSAPP_API_TOKEN'].present?

        send_message(phone: phone, message: build_message(event))
      rescue StandardError => e
        Rails.logger.warn("WhatsApp notification failed: #{e.message}")
      end

      private

      def build_message(event)
        <<~MSG
          ¡Hola! Tu inscripción a *#{event.title}* fue confirmada ☕
          📅 #{event.starts_at.strftime('%d/%m/%Y a las %H:%M')}
          📍 #{event.address}, #{event.neighborhood}

          Únete al grupo del evento:
          #{event.whatsapp_invite_link}

          ¡Nos vemos allá!
        MSG
      end

      def send_message(phone:, message:)
        require 'net/http'
        uri = URI("https://graph.facebook.com/v18.0/#{ENV['WHATSAPP_PHONE_ID']}/messages")
        request = Net::HTTP::Post.new(uri, {
          'Authorization' => "Bearer #{ENV['WHATSAPP_API_TOKEN']}",
          'Content-Type' => 'application/json'
        })
        request.body = {
          messaging_product: 'whatsapp',
          to: phone.gsub(/\D/, ''),
          type: 'text',
          text: { body: message }
        }.to_json
        Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) { |http| http.request(request) }
      end
    end
  end
end
