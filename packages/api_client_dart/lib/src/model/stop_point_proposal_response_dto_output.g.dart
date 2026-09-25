// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'stop_point_proposal_response_dto_output.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const StopPointProposalResponseDtoOutputTypeEnum
    _$stopPointProposalResponseDtoOutputTypeEnum_BUS_STATION =
    const StopPointProposalResponseDtoOutputTypeEnum._('BUS_STATION');
const StopPointProposalResponseDtoOutputTypeEnum
    _$stopPointProposalResponseDtoOutputTypeEnum_OFFICE =
    const StopPointProposalResponseDtoOutputTypeEnum._('OFFICE');
const StopPointProposalResponseDtoOutputTypeEnum
    _$stopPointProposalResponseDtoOutputTypeEnum_REST_STOP =
    const StopPointProposalResponseDtoOutputTypeEnum._('REST_STOP');
const StopPointProposalResponseDtoOutputTypeEnum
    _$stopPointProposalResponseDtoOutputTypeEnum_PICKUP_POINT =
    const StopPointProposalResponseDtoOutputTypeEnum._('PICKUP_POINT');

StopPointProposalResponseDtoOutputTypeEnum
    _$stopPointProposalResponseDtoOutputTypeEnumValueOf(String name) {
  switch (name) {
    case 'BUS_STATION':
      return _$stopPointProposalResponseDtoOutputTypeEnum_BUS_STATION;
    case 'OFFICE':
      return _$stopPointProposalResponseDtoOutputTypeEnum_OFFICE;
    case 'REST_STOP':
      return _$stopPointProposalResponseDtoOutputTypeEnum_REST_STOP;
    case 'PICKUP_POINT':
      return _$stopPointProposalResponseDtoOutputTypeEnum_PICKUP_POINT;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<StopPointProposalResponseDtoOutputTypeEnum>
    _$stopPointProposalResponseDtoOutputTypeEnumValues = BuiltSet<
        StopPointProposalResponseDtoOutputTypeEnum>(const <StopPointProposalResponseDtoOutputTypeEnum>[
  _$stopPointProposalResponseDtoOutputTypeEnum_BUS_STATION,
  _$stopPointProposalResponseDtoOutputTypeEnum_OFFICE,
  _$stopPointProposalResponseDtoOutputTypeEnum_REST_STOP,
  _$stopPointProposalResponseDtoOutputTypeEnum_PICKUP_POINT,
]);

const StopPointProposalResponseDtoOutputStatusEnum
    _$stopPointProposalResponseDtoOutputStatusEnum_PENDING =
    const StopPointProposalResponseDtoOutputStatusEnum._('PENDING');
const StopPointProposalResponseDtoOutputStatusEnum
    _$stopPointProposalResponseDtoOutputStatusEnum_APPROVED =
    const StopPointProposalResponseDtoOutputStatusEnum._('APPROVED');
const StopPointProposalResponseDtoOutputStatusEnum
    _$stopPointProposalResponseDtoOutputStatusEnum_REJECTED =
    const StopPointProposalResponseDtoOutputStatusEnum._('REJECTED');

StopPointProposalResponseDtoOutputStatusEnum
    _$stopPointProposalResponseDtoOutputStatusEnumValueOf(String name) {
  switch (name) {
    case 'PENDING':
      return _$stopPointProposalResponseDtoOutputStatusEnum_PENDING;
    case 'APPROVED':
      return _$stopPointProposalResponseDtoOutputStatusEnum_APPROVED;
    case 'REJECTED':
      return _$stopPointProposalResponseDtoOutputStatusEnum_REJECTED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<StopPointProposalResponseDtoOutputStatusEnum>
    _$stopPointProposalResponseDtoOutputStatusEnumValues = BuiltSet<
        StopPointProposalResponseDtoOutputStatusEnum>(const <StopPointProposalResponseDtoOutputStatusEnum>[
  _$stopPointProposalResponseDtoOutputStatusEnum_PENDING,
  _$stopPointProposalResponseDtoOutputStatusEnum_APPROVED,
  _$stopPointProposalResponseDtoOutputStatusEnum_REJECTED,
]);

Serializer<StopPointProposalResponseDtoOutputTypeEnum>
    _$stopPointProposalResponseDtoOutputTypeEnumSerializer =
    _$StopPointProposalResponseDtoOutputTypeEnumSerializer();
Serializer<StopPointProposalResponseDtoOutputStatusEnum>
    _$stopPointProposalResponseDtoOutputStatusEnumSerializer =
    _$StopPointProposalResponseDtoOutputStatusEnumSerializer();

class _$StopPointProposalResponseDtoOutputTypeEnumSerializer
    implements PrimitiveSerializer<StopPointProposalResponseDtoOutputTypeEnum> {
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
  final Iterable<Type> types = const <Type>[
    StopPointProposalResponseDtoOutputTypeEnum
  ];
  @override
  final String wireName = 'StopPointProposalResponseDtoOutputTypeEnum';

  @override
  Object serialize(Serializers serializers,
          StopPointProposalResponseDtoOutputTypeEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  StopPointProposalResponseDtoOutputTypeEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      StopPointProposalResponseDtoOutputTypeEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$StopPointProposalResponseDtoOutputStatusEnumSerializer
    implements
        PrimitiveSerializer<StopPointProposalResponseDtoOutputStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'PENDING': 'PENDING',
    'APPROVED': 'APPROVED',
    'REJECTED': 'REJECTED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'PENDING': 'PENDING',
    'APPROVED': 'APPROVED',
    'REJECTED': 'REJECTED',
  };

  @override
  final Iterable<Type> types = const <Type>[
    StopPointProposalResponseDtoOutputStatusEnum
  ];
  @override
  final String wireName = 'StopPointProposalResponseDtoOutputStatusEnum';

  @override
  Object serialize(Serializers serializers,
          StopPointProposalResponseDtoOutputStatusEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  StopPointProposalResponseDtoOutputStatusEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      StopPointProposalResponseDtoOutputStatusEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$StopPointProposalResponseDtoOutput
    extends StopPointProposalResponseDtoOutput {
  @override
  final String id;
  @override
  final String name;
  @override
  final StopPointProposalResponseDtoOutputTypeEnum type;
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
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;
  @override
  final StopPointProposalResponseDtoOutputStatusEnum status;
  @override
  final String? rejectionReason;
  @override
  final String? catalogStopPointId;

  factory _$StopPointProposalResponseDtoOutput(
          [void Function(StopPointProposalResponseDtoOutputBuilder)?
              updates]) =>
      (StopPointProposalResponseDtoOutputBuilder()..update(updates))._build();

  _$StopPointProposalResponseDtoOutput._(
      {required this.id,
      required this.name,
      required this.type,
      required this.address,
      required this.provinceId,
      required this.wardId,
      required this.latitude,
      required this.longitude,
      this.description,
      required this.createdAt,
      required this.updatedAt,
      required this.status,
      this.rejectionReason,
      this.catalogStopPointId})
      : super._();
  @override
  StopPointProposalResponseDtoOutput rebuild(
          void Function(StopPointProposalResponseDtoOutputBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  StopPointProposalResponseDtoOutputBuilder toBuilder() =>
      StopPointProposalResponseDtoOutputBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is StopPointProposalResponseDtoOutput &&
        id == other.id &&
        name == other.name &&
        type == other.type &&
        address == other.address &&
        provinceId == other.provinceId &&
        wardId == other.wardId &&
        latitude == other.latitude &&
        longitude == other.longitude &&
        description == other.description &&
        createdAt == other.createdAt &&
        updatedAt == other.updatedAt &&
        status == other.status &&
        rejectionReason == other.rejectionReason &&
        catalogStopPointId == other.catalogStopPointId;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, type.hashCode);
    _$hash = $jc(_$hash, address.hashCode);
    _$hash = $jc(_$hash, provinceId.hashCode);
    _$hash = $jc(_$hash, wardId.hashCode);
    _$hash = $jc(_$hash, latitude.hashCode);
    _$hash = $jc(_$hash, longitude.hashCode);
    _$hash = $jc(_$hash, description.hashCode);
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jc(_$hash, updatedAt.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, rejectionReason.hashCode);
    _$hash = $jc(_$hash, catalogStopPointId.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'StopPointProposalResponseDtoOutput')
          ..add('id', id)
          ..add('name', name)
          ..add('type', type)
          ..add('address', address)
          ..add('provinceId', provinceId)
          ..add('wardId', wardId)
          ..add('latitude', latitude)
          ..add('longitude', longitude)
          ..add('description', description)
          ..add('createdAt', createdAt)
          ..add('updatedAt', updatedAt)
          ..add('status', status)
          ..add('rejectionReason', rejectionReason)
          ..add('catalogStopPointId', catalogStopPointId))
        .toString();
  }
}

class StopPointProposalResponseDtoOutputBuilder
    implements
        Builder<StopPointProposalResponseDtoOutput,
            StopPointProposalResponseDtoOutputBuilder> {
  _$StopPointProposalResponseDtoOutput? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  StopPointProposalResponseDtoOutputTypeEnum? _type;
  StopPointProposalResponseDtoOutputTypeEnum? get type => _$this._type;
  set type(StopPointProposalResponseDtoOutputTypeEnum? type) =>
      _$this._type = type;

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

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  DateTime? _updatedAt;
  DateTime? get updatedAt => _$this._updatedAt;
  set updatedAt(DateTime? updatedAt) => _$this._updatedAt = updatedAt;

  StopPointProposalResponseDtoOutputStatusEnum? _status;
  StopPointProposalResponseDtoOutputStatusEnum? get status => _$this._status;
  set status(StopPointProposalResponseDtoOutputStatusEnum? status) =>
      _$this._status = status;

  String? _rejectionReason;
  String? get rejectionReason => _$this._rejectionReason;
  set rejectionReason(String? rejectionReason) =>
      _$this._rejectionReason = rejectionReason;

  String? _catalogStopPointId;
  String? get catalogStopPointId => _$this._catalogStopPointId;
  set catalogStopPointId(String? catalogStopPointId) =>
      _$this._catalogStopPointId = catalogStopPointId;

  StopPointProposalResponseDtoOutputBuilder() {
    StopPointProposalResponseDtoOutput._defaults(this);
  }

  StopPointProposalResponseDtoOutputBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _name = $v.name;
      _type = $v.type;
      _address = $v.address;
      _provinceId = $v.provinceId;
      _wardId = $v.wardId;
      _latitude = $v.latitude;
      _longitude = $v.longitude;
      _description = $v.description;
      _createdAt = $v.createdAt;
      _updatedAt = $v.updatedAt;
      _status = $v.status;
      _rejectionReason = $v.rejectionReason;
      _catalogStopPointId = $v.catalogStopPointId;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(StopPointProposalResponseDtoOutput other) {
    _$v = other as _$StopPointProposalResponseDtoOutput;
  }

  @override
  void update(
      void Function(StopPointProposalResponseDtoOutputBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  StopPointProposalResponseDtoOutput build() => _build();

  _$StopPointProposalResponseDtoOutput _build() {
    final _$result = _$v ??
        _$StopPointProposalResponseDtoOutput._(
          id: BuiltValueNullFieldError.checkNotNull(
              id, r'StopPointProposalResponseDtoOutput', 'id'),
          name: BuiltValueNullFieldError.checkNotNull(
              name, r'StopPointProposalResponseDtoOutput', 'name'),
          type: BuiltValueNullFieldError.checkNotNull(
              type, r'StopPointProposalResponseDtoOutput', 'type'),
          address: BuiltValueNullFieldError.checkNotNull(
              address, r'StopPointProposalResponseDtoOutput', 'address'),
          provinceId: BuiltValueNullFieldError.checkNotNull(
              provinceId, r'StopPointProposalResponseDtoOutput', 'provinceId'),
          wardId: BuiltValueNullFieldError.checkNotNull(
              wardId, r'StopPointProposalResponseDtoOutput', 'wardId'),
          latitude: BuiltValueNullFieldError.checkNotNull(
              latitude, r'StopPointProposalResponseDtoOutput', 'latitude'),
          longitude: BuiltValueNullFieldError.checkNotNull(
              longitude, r'StopPointProposalResponseDtoOutput', 'longitude'),
          description: description,
          createdAt: BuiltValueNullFieldError.checkNotNull(
              createdAt, r'StopPointProposalResponseDtoOutput', 'createdAt'),
          updatedAt: BuiltValueNullFieldError.checkNotNull(
              updatedAt, r'StopPointProposalResponseDtoOutput', 'updatedAt'),
          status: BuiltValueNullFieldError.checkNotNull(
              status, r'StopPointProposalResponseDtoOutput', 'status'),
          rejectionReason: rejectionReason,
          catalogStopPointId: catalogStopPointId,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
