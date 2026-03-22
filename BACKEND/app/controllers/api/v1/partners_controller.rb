class Api::V1::PartnersController < Api::V1::BaseController
  skip_after_action :verify_policy_scoped, only: %i[index show create update destroy]

  def index
    authorize :partner, :index?, policy_class: Authorization::Policies::PartnerPolicy
    partners = ::Partner.order(:name)
    render json: {
      data: partners.map { |partner| serialize_partner(partner) },
      meta: { total: partners.size }
    }
  end

  def show
    authorize :partner, :show?, policy_class: Authorization::Policies::PartnerPolicy
    render json: { data: serialize_partner(::Partner.find(params[:id])) }
  end

  def create
    authorize :partner, :create?, policy_class: Authorization::Policies::PartnerPolicy
    partner = ::Partner.create!(partner_params)
    render json: { data: serialize_partner(partner) }, status: :created
  end

  def update
    authorize :partner, :update?, policy_class: Authorization::Policies::PartnerPolicy
    partner = ::Partner.find(params[:id])
    partner.update!(partner_params)
    render json: { data: serialize_partner(partner) }
  end

  def destroy
    authorize :partner, :destroy?, policy_class: Authorization::Policies::PartnerPolicy
    ::Partner.find(params[:id]).destroy!
    head :no_content
  end

  private

  def partner_params
    params.permit(:name, :partner_type, :neighborhood, :address, :contact_name, :contact_phone, :notes, :active)
  end

  def serialize_partner(partner)
    {
      id: partner.id.to_s,
      type: 'partners',
      attributes: {
        name: partner.name,
        partner_type: partner.partner_type,
        neighborhood: partner.neighborhood,
        address: partner.address,
        contact_name: partner.contact_name,
        contact_phone: partner.contact_phone,
        notes: partner.notes,
        active: partner.active
      }
    }
  end
end
