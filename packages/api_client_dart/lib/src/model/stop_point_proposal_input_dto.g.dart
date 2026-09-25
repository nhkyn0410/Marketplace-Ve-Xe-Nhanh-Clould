// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'stop_point_proposal_input_dto.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const StopPointProposalInputDtoTypeEnum
    _$stopPointProposalInputDtoTypeEnum_BUS_STATION =
    const StopPointProposalInputDtoTypeEnum._('BUS_STATION');
const StopPointProposalInputDtoTypeEnum
    _$stopPointProposalInputDtoTypeEnum_OFFICE =
    const StopPointProposalInputDtoTypeEnum._('OFFICE');
const StopPointProposalInputDtoTypeEnum
    _$stopPointProposalInputDtoTypeEnum_REST_STOP =
    const StopPointProposalInputDtoTypeEnum._('REST_STOP');
const StopPointProposalInputDtoTypeEnum
    _$stopPointProposalInputDtoTypeEnum_PICKUP_POINT =
    const StopPointProposalInputDtoTypeEnum._('PICKUP_POINT');

StopPointProposalInputDtoTypeEnum _$stopPointProposalInputDtoTypeEnumValueOf(
    String name) {
  switch (name) {
    case 'BUS_STATION':
      return _$stopPointProposalInputDtoTypeEnum_BUS_STATION;
    case 'OFFICE':
      return _$stopPointProposalInputDtoTypeEnum_OFFICE;
    case 'REST_STOP':
      return _$stopPointProposalInputDtoTypeEnum_REST_STOP;
    case 'PICKUP_POINT':
      return _$stopPointProposalInputDtoTypeEnum_PICKUP_POINT;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<StopPointProposalInputDtoTypeEnum>
    _$stopPointProposalInputDtoTypeEnumValues = BuiltSet<
        StopPointProposalInputDtoTypeEnum>(const <StopPointProposalInputDtoTypeEnum>[
  _$stopPointProposalInputDtoTypeEnum_BUS_STATION,
  _$stopPointProposalInputDtoTypeEnum_OFFICE,
  _$stopPointProposalInputDtoTypeEnum_REST_STOP,
  _$stopPointProposalInputDtoTypeEnum_PICKUP_POINT,
]);

Serializer<StopPointProposalInputDtoTypeEnum>
    _$stopPointProposalInputDtoTypeEnumSerializer =
    _$StopPointProposalInputDtoTypeEnumSerializer();

class _$StopPointProposalInputDtoTypeEnumSerializer
    implements PrimitiveSerializer<StopPointProposalInputDtoTypeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'BUS_STATION': 'BUS_STATION',
    'OFFICE': 'OFFICE',
    'REST_STOP': 'REST_STOP',
    'PICKUP_POINT': 'PICKUP_POINT',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'BUS_STATION': 'BUS_STATION',
    'OFFICE': 'OFFICE',
    'REST_STOP': 'REST_STOP',
    'PICKUP_POINT': 'PICKUP_POINT',
  };

  @override
  final Iterable<Type> types = const <Type>[StopPointProposalInputDtoTypeEnum];
  @override
  final String wireName = 'StopPointProposalInputDtoTypeEnum';

  @override
  Object serialize(
          Serializers serializers, StopPointProposalInputDtoTypeEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  StopPointProposalInputDtoTypeEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      StopPointProposalInputDtoTypeEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$StopPointProposalInputDto extends StopPointProposalInputDto {
  @override
  final String name;
  @override
  final StopPointProposalInputDtoTypeEnum type;
  @override
  final String address;
  @override
  final String provinceId;
  @override
  final String wardId;
  @override
  final num latitude;
  @override
  final num longitude;
  @override
  final String? description;

  factory _$StopPointProposalInputDto(
          [void Function(StopPointProposalInputDtoBuilder)? updates]) =>
      (StopPointProposalInputDtoBuilder()..update(updates))._build();

  _$StopPointProposalInputDto._(
      {required this.name,
      required this.type,
      required this.address,
      required this.provinceId,
      required this.wardId,
      required this.latitude,
      required this.longitude,
      this.description})
      : super._();
  @override
  StopPointProposalInputDto rebuild(
          void Function(StopPointProposalInputDtoBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  StopPointProposalInputDtoBuilder toBuilder() =>
      StopPointProposalInputDtoBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is StopPointProposalInputDto &&
        name == other.name &&
        type == other.type &&
        address == other.address &&
        provinceId == other.provinceId &&
        wardId == other.wardId &&
        latitude == other.latitude &&
        longitude == other.longitude &&
        description == other.description;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, type.hashCode);
    _$hash = $jc(_$hash, address.hashCode);
    _$hash = $jc(_$hash, provinceId.hashCode);
    _$hash = $jc(_$hash, wardId.hashCode);
    _$hash = $jc(_$hash, latitude.hashCode);
    _$hash = $jc(_$hash, longitude.hashCode);
    _$hash = $jc(_$hash, description.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'StopPointProposalInputDto')
          ..add('name', name)
          ..add('type', type)
          ..add('address', address)
          ..add('provinceId', provinceId)
          ..add('wardId', wardId)
          ..add('latitude', latitude)
          ..add('longitude', longitude)
          ..add('description', description))
        .toString();
  }
}

class StopPointProposalInputDtoBuilder
    implements
        Builder<StopPointProposalInputDto, StopPointProposalInputDtoBuilder> {
  _$StopPointProposalInputDto? _$v;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  StopPointProposalInputDtoTypeEnum? _type;
  StopPointProposalInputDtoTypeEnum? get type => _$this._type;
  set type(StopPointProposalInputDtoTypeEnum? type) => _$this._type = type;

  String? _address;
  String? get address => _$this._address;
  set address(String? address) => _$this._address = address;

  String? _provinceId;
  String? get provinceId => _$this._provinceId;
  set provinceId(String? provinceId) => _$this._provinceId = provinceId;

  String? _wardId;
  String? get wardId => _$this._wardId;
  set wardId(String? wardId) => _$this._wardId = wardId;

  num? _latitude;
  num? get latitude => _$this._latitude;
  set latitude(num? latitude) => _$this._latitude = latitude;

  num? _longitude;
  num? get longitude => _$this._longitude;
  set longitude(num? longitude) => _$this._longitude = longitude;

  String? _description;
  String? get description => _$this._description;
  set description(String? description) => _$this._description = description;

  StopPointProposalInputDtoBuilder() {
    StopPointProposalInputDto._defaults(this);
  }

  StopPointProposalInputDtoBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _name = $v.name;
      _type = $v.type;
      _address = $v.address;
      _provinceId = $v.provinceId;
      _wardId = $v.wardId;
      _latitude = $v.latitude;
      _longitude = $v.longitude;
      _description = $v.description;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(StopPointProposalInputDto other) {
    _$v = other as _$StopPointProposalInputDto;
  }

  @override
  void update(void Function(StopPointProposalInputDtoBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  StopPointProposalInputDto build() => _build();

  _$StopPointProposalInputDto _build() {
    final _$result = _$v ??
        _$StopPointProposalInputDto._(
          name: BuiltValueNullFieldError.checkNotNull(
              name, r'StopPointProposalInputDto', 'name'),
          type: BuiltValueNullFieldError.checkNotNull(
              type, r'StopPointProposalInputDto', 'type'),
          address: BuiltValueNullFieldError.checkNotNull(
              address, r'StopPointProposalInputDto', 'address'),
          provinceId: BuiltValueNullFieldError.checkNotNull(
              provinceId, r'StopPointProposalInputDto', 'provinceId'),
          wardId: BuiltValueNullFieldError.checkNotNull(
              wardId, r'StopPointProposalInputDto', 'wardId'),
          latitude: BuiltValueNullFieldError.checkNotNull(
              latitude, r'StopPointProposalInputDto', 'latitude'),
          longitude: BuiltValueNullFieldError.checkNotNull(
              longitude, r'StopPointProposalInputDto', 'longitude'),
          description: description,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
